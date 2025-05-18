import sqlite3
from datetime import datetime

DB_PATH = 'attendees.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS attendees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            queue_number INTEGER UNIQUE NOT NULL,
            key_ready BOOLEAN DEFAULT 0,
            key_collected BOOLEAN DEFAULT 0,
            ready_timestamp DATETIME
        )
    ''')
    conn.commit()
    # Seed with 224 attendees if empty
    c.execute('SELECT COUNT(*) FROM attendees')
    if c.fetchone()[0] == 0:
        attendees = [(f'Attendee {i}', i) for i in range(1, 225)]
        c.executemany('INSERT INTO attendees (name, queue_number) VALUES (?, ?)', attendees)
        conn.commit()
    conn.close() 