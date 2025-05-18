from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from models import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/api/attendees', methods=['GET'])
def get_attendees():
    conn = get_db_connection()
    attendees = conn.execute('SELECT * FROM attendees').fetchall()
    conn.close()
    return jsonify([dict(row) for row in attendees])

@app.route('/api/attendees/<int:queue_number>', methods=['GET'])
def get_attendee(queue_number):
    conn = get_db_connection()
    attendee = conn.execute('SELECT * FROM attendees WHERE queue_number = ?', (queue_number,)).fetchone()
    conn.close()
    if attendee:
        return jsonify(dict(attendee))
    return jsonify({'error': 'Attendee not found'}), 404

@app.route('/api/attendees', methods=['POST'])
def add_attendee():
    data = request.get_json()
    name = data.get('name')
    queue_number = data.get('queue_number')
    if not name or not queue_number:
        return jsonify({'error': 'Name and queue_number required'}), 400
    try:
        conn = get_db_connection()
        conn.execute('INSERT INTO attendees (name, queue_number) VALUES (?, ?)', (name, queue_number))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Attendee added'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/attendees/<int:queue_number>', methods=['PUT'])
def update_attendee(queue_number):
    data = request.get_json()
    fields = []
    values = []
    if 'name' in data:
        fields.append('name = ?')
        values.append(data['name'])
    if 'queue_number' in data:
        fields.append('queue_number = ?')
        values.append(data['queue_number'])
    if 'key_ready' in data:
        fields.append('key_ready = ?')
        values.append(int(data['key_ready']))
        if data['key_ready']:
            fields.append('ready_timestamp = ?')
            values.append(datetime.now().isoformat())
        else:
            fields.append('ready_timestamp = ?')
            values.append(None)
    if 'key_collected' in data:
        fields.append('key_collected = ?')
        values.append(int(data['key_collected']))
    if not fields:
        return jsonify({'error': 'No valid fields to update'}), 400
    values.append(queue_number)
    try:
        conn = get_db_connection()
        conn.execute(f'UPDATE attendees SET {", ".join(fields)} WHERE queue_number = ?', values)
        conn.commit()
        conn.close()
        return jsonify({'message': 'Attendee updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/ready', methods=['GET'])
def get_ready():
    conn = get_db_connection()
    attendee = conn.execute('SELECT queue_number FROM attendees WHERE key_ready = 1 AND key_collected = 0 ORDER BY id ASC LIMIT 1').fetchone()
    conn.close()
    return jsonify({'ready_number': attendee['queue_number'] if attendee else None})

@app.route('/api/missed', methods=['GET'])
def get_missed():
    five_minutes_ago = datetime.now() - timedelta(minutes=5)
    conn = get_db_connection()
    missed = conn.execute('SELECT queue_number FROM attendees WHERE key_ready = 1 AND key_collected = 0 AND ready_timestamp IS NOT NULL AND ready_timestamp < ?', (five_minutes_ago.isoformat(),)).fetchall()
    conn.close()
    return jsonify({'missed_numbers': [row['queue_number'] for row in missed]})

if __name__ == '__main__':
    app.run(debug=True)