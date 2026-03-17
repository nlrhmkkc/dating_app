from django.db import models


class Person(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    description = models.TextField(blank=True)
    image_path = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.age})"


class Message(models.Model):
    TYPE_CHOICES = [('text', 'Text'), ('image', 'Image')]
    FROM_CHOICES = [('me', 'Me'), ('them', 'Them')]

    conversation = models.CharField(max_length=100)   # a másik fél neve
    msg_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='text')
    content = models.TextField()
    from_who = models.CharField(max_length=10, choices=FROM_CHOICES)
    avatar = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.conversation}] {self.from_who}: {self.content[:40]}"
