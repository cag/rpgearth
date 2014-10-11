from datetime import datetime
from django.db import models
from django.contrib.auth.models import User

class Item(models.Model):
    name = models.CharField(blank=True, max_length=64)
    weight = models.IntegerField(default=0)
    item_type = models.IntegerField(default=0)

class Equipment(models.Model):
    item = models.OneToOneField(Item, primary_key=True)
    equip_type = models.IntegerField(default=0)

    health = models.IntegerField(default=0)
    attack = models.IntegerField(default=0)
    defense = models.IntegerField(default=0)
    speed = models.IntegerField(default=0)
    magic = models.IntegerField(default=0)
    spirit = models.IntegerField(default=0)
    charm = models.IntegerField(default=0)

    description_functions = models.TextField(blank=True)

class Consumable(models.Model):
    item = models.OneToOneField(Item, primary_key=True)
    effect_function = models.TextField(blank=True)

class Ability(models.Model):
    name = models.CharField(blank=True, max_length=64)
    effect_function = models.TextField(blank=True)
    cooldown_time = models.FloatField(default=0.0)

class Player(models.Model):
    user = models.OneToOneField(User, primary_key=True)
    active = models.BooleanField(default=False)
    friends = models.ManyToManyField("self")

    geolocation_latitude = models.FloatField(default=0.0)
    geolocation_longitude = models.FloatField(default=0.0)
    geolocation_accuracy = models.FloatField(default=0.0)
    geolocation_sync_time = models.DateTimeField(default=datetime.utcfromtimestamp(0))

    level = models.IntegerField(default=0)
    current_exp = models.IntegerField(default=0)
    exp_to_next = models.IntegerField(default=0)

    max_hp = models.IntegerField(default=0)
    strength = models.IntegerField(default=0)
    constitution = models.IntegerField(default=0)
    dexterity = models.IntegerField(default=0)
    intelligence = models.IntegerField(default=0)
    wisdom = models.IntegerField(default=0)
    charisma = models.IntegerField(default=0)

    abilities = models.ManyToManyField(Ability)

    golds = models.IntegerField(default=0)
    current_hp = models.IntegerField(default=0)

    items = models.ManyToManyField(Item)

    last_action_time = models.DateTimeField(default=datetime.utcfromtimestamp(0))
    last_death_time = models.DateTimeField(default=datetime.utcfromtimestamp(0))

class Message(models.Model):
    sender = models.ForeignKey(Player, related_name='sent_messages')
    recipients = models.ManyToManyField(Player, related_name='recieved_messages')
    send_time = models.DateTimeField(default=datetime.utcfromtimestamp(0))
    body = models.CharField(blank=True, max_length=256)
