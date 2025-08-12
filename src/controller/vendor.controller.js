import User from "../models/User.model.js";

export class VendorController {
    static async VendorRequest(req, res) {
        try {
            const { gstInNumber, company } = req.body;
            const user = req.user;
            const userDetails = await User.findById(user.id.toString());
            if (!userDetails) {
                return res.status(404).json({ message: 'User not found.' });
            }
            if (userDetails.isRequestedForVendor && user.role !== 'vendor') {
                return res.status(403).json({ message: 'Forbidden. You have already requested to become a vendor' });
            } else if (user.isRequestedForVendor && user.role === 'vendor') {
                return res.status(403).json({ message: 'Forbidden. You are already a vendor.' });
            }

            await User.findByIdAndUpdate(user.id.toString(),
                {
                    gstInNumber, company, isRequestedForVendor: true
                }
            )

            res.status(200).json({ message: 'Vendor request received.' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to handle vendor request.', error: error.message });
        }
    }

    static async AcceptVendorRequest(req, res) {
        try {
            const { userId } = req.params;
            const { accept, commissionRate } = req.body;
            const user = req.user;
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden. Only admins can accept vendor requests.' });
            }

            if (accept && !commissionRate) {
                return res.status(400).json({ message: 'Commission rate is required to accept vendor request.' });
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                accept
                    ? { role: 'vendor', commissionRate }
                    : { isRequestedForVendor: false, gstInNumber: '', company: '' },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ message: 'Vendor request accepted.' });

        } catch (error) {
            res.status(500).json({ message: 'Failed to accept vendor request.', error: error.message });
        }
    }

    static async incomingVendorRequests(req, res) {
        try {
            const user = req.user;
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden. You are not authorized to access this' });
            }
            const users = await User.find({ isRequestedForVendor: true, role: 'user' });
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch incoming vendor requests.', error: error.message });
        }
    }
}