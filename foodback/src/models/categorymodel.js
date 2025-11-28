import mongoose from "mongoose";
const { Schema, model } = mongoose;

const categorySchema = new Schema({
  
  category: { type: String, trim: true },
  
}, { versionKey: false},{timestamps: false });

export default model("Category", categorySchema); 
