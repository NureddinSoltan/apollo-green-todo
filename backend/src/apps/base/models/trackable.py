from .auditable import AuditableModel
from .time_stamped import TimeStampedModel
from django.db import models

class TrackableModel(TimeStampedModel, AuditableModel):
    class Meta:
        abstract = True
