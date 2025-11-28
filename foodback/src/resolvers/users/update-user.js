import mongoose from "mongoose";
import User from "../../models/usermodel.js";

// Mongoose-ийн ObjectId шалгах туслах функц
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ ID формат буруу бол
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Буруу ID" });
    }

    // 2️⃣ Хэрэглэгчийн илгээсэн өгөгдлөөс шинэчлэл хийх payload бэлтгэх
    const payload = {};
    ["name", "email", "phone"].forEach((key) => {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    });

    // 3️⃣ DB дотор ID-гаар хайж шинэчлэх
    const updated = await User.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    // 4️⃣ Хэрвээ ийм хэрэглэгч байхгүй бол
    if (!updated) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    // 5️⃣ Амжилттай бол шинэчлэгдсэн хэрэглэгчийг буцаах
    res.status(200).json(updated);
  } catch (err) {
    // 6️⃣ Алдаа гарвал
    res.status(500).json({ message: "Алдаа гарлаа", error: err.message });
  }
};
