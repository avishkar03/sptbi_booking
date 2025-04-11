from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0003_add_missing_floor_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='floor',
            name='order',
            field=models.IntegerField(default=0, help_text='Order in which the floor appears in the dropdown'),
        ),
    ] 