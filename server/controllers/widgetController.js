import Widget from '../models/widgetModel.js';

export const getWidgets = async (req, res) => {
  try {
    const widgets = await Widget.find();
    res.json(widgets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createWidget = async (req, res) => {
  try {
    const { name, settings } = req.body;
    const widget = new Widget({ name, settings });
    await widget.save();
    res.status(201).json(widget);
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
};
