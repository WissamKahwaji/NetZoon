
import { DeviceList } from "../models/electronic_devices/device_listModel.js";
import { ElectronicDevices } from "../models/electronic_devices/electronic_devicesModel.js";



export const getElectronicDevices = async (req, res) => {
    try {

        const data = await ElectronicDevices.find({});
        return res.json({
            msg: "success",
            results: data,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
}


export const getElectronicDevicesItems = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await ElectronicDevices.findById(id).populate('deviceList');
        return res.json({
            msg: "success",
            results: data,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
}




export const getElectronicDevicById = async (req, res) => {
    const { id } = req.params;
    try {

        const data = await DeviceList.findById(id);
        if (!data) {
            return res.status(404).json({ message: 'no Data Found' });
        }
        return res.json({
            msg: "success",
            results: data,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}