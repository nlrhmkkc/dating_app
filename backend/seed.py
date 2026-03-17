"""
Futtasd: python seed.py
Ez betölti a people.json-t és elmenti az adatbázisba.
Helyezd a people.json-t ugyanebbe a mappába, vagy add meg az elérési utat.
"""
import os
import sys
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from api.models import Person

PEOPLE_JSON_PATH = os.path.join(os.path.dirname(__file__), 'people.json')

if not os.path.exists(PEOPLE_JSON_PATH):
    print(f"Nem találom: {PEOPLE_JSON_PATH}")
    print("Másold ide a people.json-t, majd futtasd újra.")
    sys.exit(1)

with open(PEOPLE_JSON_PATH, encoding='utf-8') as f:
    data = json.load(f)

created = 0
for p in data:
    _, was_created = Person.objects.get_or_create(
        id=p['id'],
        defaults={
            'name': p['name'],
            'age': p['age'],
            'description': p.get('description', ''),
            'image_path': p.get('imagePath', p.get('image_path', '')),
        }
    )
    if was_created:
        created += 1

print(f"Kész! {created} új személy hozzáadva (összesen {Person.objects.count()} az adatbázisban).")
