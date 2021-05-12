const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notificationType: {
      type: String,
    },
    opened: {
      type: Boolean,
      default: false,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true },
);

NotificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityId,
) => {
  const data = {
    userTo,
    userFrom,
    notificationType,
    entityId,
  };
  // eslint-disable-next-line no-use-before-define
  await Notification.deleteOne(data);
  // eslint-disable-next-line no-use-before-define
  return Notification.create(data);
};

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
