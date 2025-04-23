from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0002_floor_alter_booking_floor'),
    ]

    operations = [
        migrations.AddField(
            model_name='floor',
            name='slug',
            field=models.SlugField(default='temp', help_text="URL-friendly version of the name (e.g., 'floor-1')", unique=True),
            preserve_default=False,
        ),
    ] 