from django.db import models
from django.contrib.auth.models import User

class Item(models.Model):
    name = models.CharField(max_length=64)
    weight = models.IntegerField()
    item_type = models.IntegerField()

class Equipment(models.Model):
    item = models.OneToOneField(Item, primary_key=True)
    equip_type = models.IntegerField()

    health = models.IntegerField()
    attack = models.IntegerField()
    defense = models.IntegerField()
    speed = models.IntegerField()
    magic = models.IntegerField()
    spirit = models.IntegerField()
    charm = models.IntegerField()

    description_functions = models.TextField()

class Consumable(models.Model):
    item = models.OneToOneField(Item, primary_key=True)
    effect_function = models.TextField()

class Ability(models.Model):
    name = models.CharField(max_length=64)
    effect_function = models.TextField()
    cooldown_time = models.FloatField()

class Player(models.Model):
    user = models.OneToOneField(User, primary_key=True)
    active = models.BooleanField(default=False)
    friends = models.ManyToManyField("self")

    geolocation_latitude = models.FloatField()
    geolocation_longitude = models.FloatField()
    geolocation_accuracy = models.FloatField()
    geolocation_sync_time = models.DateTimeField()

    level = models.IntegerField()
    current_exp = models.IntegerField()
    exp_to_next = models.IntegerField()

    max_hp = models.IntegerField()
    strength = models.IntegerField()
    constitution = models.IntegerField()
    dexterity = models.IntegerField()
    intelligence = models.IntegerField()
    wisdom = models.IntegerField()
    charisma = models.IntegerField()

    abilities = models.ManyToManyField(Ability)

    golds = models.IntegerField()
    current_hp = models.IntegerField()

    items = models.ManyToManyField(Item)

    last_action_time = models.DateTimeField()
    last_death_time = models.DateTimeField()

class Message(models.Model):
    sender = models.ForeignKey(Player, related_name='sent_messages')
    recipients = models.ManyToManyField(Player, related_name='recieved_messages')
    send_time = models.DateTimeField()
    body = models.CharField(max_length=256)
