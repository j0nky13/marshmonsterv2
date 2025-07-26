import mongoose from 'mongoose';

const widgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  settings: { type: Object, default: {} }
});

const Widget = mongoose.model('Widget', widgetSchema);

export default Widget;
