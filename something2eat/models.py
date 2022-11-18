from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Ingredient(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails")
    ingredient = models.CharField(max_length=255)

    def serialize(self):
        return {
            "ingredient": self.ingredient,            
        }
