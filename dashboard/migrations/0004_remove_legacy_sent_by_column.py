from django.db import migrations


def drop_legacy_sent_by_column(apps, schema_editor):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, 'dashboard_match')
        }
        if 'sent_by' in columns and 'sent_by_id' in columns:
            cursor.execute('ALTER TABLE dashboard_match DROP COLUMN sent_by')


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0003_match_sent_by_and_sent_at'),
    ]

    operations = [
        migrations.RunPython(drop_legacy_sent_by_column, migrations.RunPython.noop),
    ]
