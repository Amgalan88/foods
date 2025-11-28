import { isValidObjectId } from "mongoose";
import User from "../../models/usermodel.js";

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ messega: "buruu id " });
    }

    const doc = await User.findById(id).select("-email ");
    if (!doc) {
      return res.status(404).json({ message: "id oldsongvi" });
    }

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ message: "aldaa garaw" });
  }
};

// import { isValidObjectId } from "mongoose";
// import Order from "../../models/ordermodel.js"

// export const getOrderById = async (req, res)=>{

// try{

//     const {id} = req.params;
//     if(!isValidObjectId(id)){ return res.status(400).json({message: "aldaa id oldsongvi"})
//     }
//     const doc = await Order.findById(id);

//        if (!doc) {return res.status(404).json({message: "olsongvi"})
//     }

//     res.status(200).json(doc);

// } catch (err){
//     res.status(500).json({message: "aldaa garlaa" })
// }

// }
