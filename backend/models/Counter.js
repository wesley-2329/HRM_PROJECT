const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

CounterSchema.statics.getNextSequence = async function(sequenceName, initialCount = 0) {
  const counter = await this.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  if (initialCount && counter.seq < initialCount) {
    const updated = await this.findByIdAndUpdate(
      sequenceName,
      { $set: { seq: initialCount } },
      { new: true }
    );
    return updated.seq;
  }
  return counter.seq;
};

module.exports = mongoose.model("Counter", CounterSchema);
