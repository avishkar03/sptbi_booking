from django.contrib.auth.base_user import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, company_name, password=None, **extra_fields):
        if not company_name:
            raise ValueError('The Company Name must be set')
        extra_fields['email'] = self.normalize_email(extra_fields['email'])
        user = self.model(company_name=company_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, company_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active',True)
        return self.create_user(company_name, password, **extra_fields)
