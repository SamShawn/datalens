"""
数据分析可视化工具 - 后端服务
提供数据上传、处理和分析的API接口
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json
from werkzeug.utils import secure_filename
import io

app = Flask(__name__)
CORS(app)

# 配置
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../data')
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 确保上传目录存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """检查文件扩展名是否合法"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    上传数据文件
    支持CSV和Excel格式
    """
    if 'file' not in request.files:
        return jsonify({'error': '没有文件被上传'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '文件名为空'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # 读取数据并返回基本信息
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(filepath)
            else:
                df = pd.read_excel(filepath)

            # 获取数据的基本信息
            data_info = {
                'filename': filename,
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': list(df.columns),
                'column_types': {
                    col: str(dtype) for col, dtype in df.dtypes.items()
                },
                'preview': df.head(10).to_dict('records'),
                'missing_values': {
                    col: int(df[col].isna().sum()) for col in df.columns
                }
            }

            return jsonify(data_info), 200

        except Exception as e:
            return jsonify({'error': f'文件解析失败: {str(e)}'}), 400

    return jsonify({'error': '不支持的文件格式'}), 400


@app.route('/api/data/<filename>', methods=['GET'])
def get_data(filename):
    """
    获取指定文件的数据
    支持分页查询
    """
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': '文件不存在'}), 404

        # 读取文件
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # 分页参数
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))

        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page

        # 返回分页数据
        data = {
            'total': len(df),
            'page': page,
            'per_page': per_page,
            'total_pages': (len(df) + per_page - 1) // per_page,
            'data': df.iloc[start_idx:end_idx].to_dict('records')
        }

        return jsonify(data), 200

    except Exception as e:
        return jsonify({'error': f'读取数据失败: {str(e)}'}), 400


@app.route('/api/process', methods=['POST'])
def process_data():
    """
    数据处理接口
    支持数据清洗、缺失值处理、过滤等操作
    """
    try:
        data = request.json
        filename = data.get('filename')
        operations = data.get('operations', [])

        if not filename:
            return jsonify({'error': '缺少文件名'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': '文件不存在'}), 404

        # 读取数据
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # 应用处理操作
        for op in operations:
            op_type = op.get('type')

            if op_type == 'filter':
                # 条件过滤
                column = op.get('column')
                operator = op.get('operator')  # 'eq', 'gt', 'lt', 'contains'
                value = op.get('value')

                if operator == 'eq':
                    df = df[df[column] == value]
                elif operator == 'gt':
                    df = df[df[column] > float(value)]
                elif operator == 'lt':
                    df = df[df[column] < float(value)]
                elif operator == 'contains':
                    df = df[df[column].astype(str).str.contains(str(value), na=False)]

            elif op_type == 'fill_na':
                # 填充缺失值
                column = op.get('column')
                value = op.get('value')
                if column == 'all':
                    df = df.fillna(value)
                else:
                    df[column] = df[column].fillna(value)

            elif op_type == 'drop_na':
                # 删除缺失值
                if op.get('how') == 'all':
                    df = df.dropna(how='all')
                else:
                    df = df.dropna()

            elif op_type == 'sort':
                # 排序
                column = op.get('column')
                ascending = op.get('ascending', True)
                df = df.sort_values(by=column, ascending=ascending)

            elif op_type == 'select_columns':
                # 选择列
                columns = op.get('columns', [])
                df = df[columns]

        # 返回处理后的数据
        result = {
            'total': len(df),
            'columns': list(df.columns),
            'data': df.head(100).to_dict('records'),  # 限制返回100条
            'preview': df.head(10).to_dict('records')
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'数据处理失败: {str(e)}'}), 400


@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """
    数据分析接口
    计算统计信息、相关性等
    """
    try:
        data = request.json
        filename = data.get('filename')
        analysis_type = data.get('type', 'summary')

        if not filename:
            return jsonify({'error': '缺少文件名'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': '文件不存在'}), 404

        # 读取数据
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        result = {}

        if analysis_type == 'summary':
            # 基本统计信息
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            result['numeric_stats'] = {}

            for col in numeric_cols:
                result['numeric_stats'][col] = {
                    'count': int(df[col].count()),
                    'mean': float(df[col].mean()) if df[col].count() > 0 else None,
                    'std': float(df[col].std()) if df[col].count() > 0 else None,
                    'min': float(df[col].min()) if df[col].count() > 0 else None,
                    'max': float(df[col].max()) if df[col].count() > 0 else None,
                    'median': float(df[col].median()) if df[col].count() > 0 else None,
                }

            # 分类列统计
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            result['categorical_stats'] = {}

            for c in categorical_cols:
                value_counts = df[c].value_counts().head(10)
                result['categorical_stats'][c] = {
                    'unique': int(df[c].nunique()),
                    'top_values': value_counts.to_dict()
                }

        elif analysis_type == 'correlation':
            # 相关性矩阵
            numeric_df = df.select_dtypes(include=[np.number])
            if len(numeric_df.columns) > 1:
                corr_matrix = numeric_df.corr()
                result['correlation'] = corr_matrix.round(4).to_dict()

        elif analysis_type == 'distributions':
            # 分布统计（用于绘图）
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            result['distributions'] = {}

            for col in numeric_cols:
                # 计算分位数
                result['distributions'][col] = {
                    'min': float(df[col].min()),
                    'max': float(df[col].max()),
                    'mean': float(df[col].mean()),
                    'median': float(df[col].median()),
                    'std': float(df[col].std()),
                    'quartiles': {
                        '25%': float(df[col].quantile(0.25)),
                        '50%': float(df[col].quantile(0.5)),
                        '75%': float(df[col].quantile(0.75)),
                    }
                }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'分析失败: {str(e)}'}), 400


@app.route('/api/export', methods=['POST'])
def export_data():
    """
    导出处理后的数据
    支持CSV和Excel格式
    """
    try:
        data = request.json
        filename = data.get('filename')
        operations = data.get('operations', [])
        export_format = data.get('format', 'csv')

        if not filename:
            return jsonify({'error': '缺少文件名'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': '文件不存在'}), 404

        # 读取数据
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        # 应用处理操作
        for op in operations:
            op_type = op.get('type')
            if op_type == 'filter':
                column = op.get('column')
                operator = op.get('operator')
                value = op.get('value')
                if operator == 'eq':
                    df = df[df[column] == value]
                elif operator == 'gt':
                    df = df[df[column] > float(value)]
                elif operator == 'lt':
                    df = df[df[column] < float(value)]
                elif operator == 'contains':
                    df = df[df[column].astype(str).str.contains(str(value), na=False)]
            elif op_type == 'fill_na':
                column = op.get('column')
                value = op.get('value')
                if column == 'all':
                    df = df.fillna(value)
                else:
                    df[column] = df[column].fillna(value)
            elif op_type == 'drop_na':
                if op.get('how') == 'all':
                    df = df.dropna(how='all')
                else:
                    df = df.dropna()
            elif op_type == 'select_columns':
                columns = op.get('columns', [])
                df = df[columns]

        # 生成输出文件
        output = io.BytesIO()
        output_filename = f"exported_{filename.rsplit('.', 1)[0]}.{export_format}"

        if export_format == 'csv':
            df.to_csv(output, index=False)
            output.seek(0)
            return send_file(
                output,
                mimetype='text/csv',
                as_attachment=True,
                download_name=output_filename
            )
        elif export_format in ['xlsx', 'xls']:
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            return send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=output_filename
            )

        return jsonify({'error': '不支持的导出格式'}), 400

    except Exception as e:
        return jsonify({'error': f'导出失败: {str(e)}'}), 400


@app.route('/api/files', methods=['GET'])
def list_files():
    """列出所有已上传的文件"""
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(filepath) and allowed_file(filename):
                files.append({
                    'filename': filename,
                    'size': os.path.getsize(filepath),
                    'created': os.path.getctime(filepath)
                })
        return jsonify(files), 200
    except Exception as e:
        return jsonify({'error': f'获取文件列表失败: {str(e)}'}), 400


@app.route('/api/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    """删除指定文件"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': '文件不存在'}), 404

        os.remove(filepath)
        return jsonify({'message': '文件删除成功'}), 200

    except Exception as e:
        return jsonify({'error': f'删除文件失败: {str(e)}'}), 400


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    print("=" * 50)
    print("数据分析可视化工具 - 后端服务")
    print("=" * 50)
    print("服务启动中...")
    print(f"上传目录: {UPLOAD_FOLDER}")
    print("API地址: http://localhost:5002")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5002, debug=True)
