import Policy from '../models/Policy.model.js';
import Websitelist from '../models/Website.model.js';

export const createOrUpdatePolicy = async (req, res) => {
    try {
        const { referenceWebsite, privacyPolicy, termsAndConditions, refundPolicy, shippingPolicy } = req.body;
        const websiteExists = await Websitelist.findById(referenceWebsite);
        if (!websiteExists) {
            return res.status(404).json({ message: 'Reference website not found' });
        }
        let existingPolicy = await Policy.findOne({ referenceWebsite });
        if (existingPolicy) {
            existingPolicy.privacyPolicy = privacyPolicy || existingPolicy.privacyPolicy;
            existingPolicy.termsAndConditions = termsAndConditions || existingPolicy.termsAndConditions;
            existingPolicy.refundPolicy = refundPolicy || existingPolicy.refundPolicy;
            existingPolicy.shippingPolicy = shippingPolicy || existingPolicy.shippingPolicy;
            await existingPolicy.save();
            return res.status(200).json({ message: 'Policy updated successfully', policy: existingPolicy });
        }
        const newPolicy = new Policy({
            referenceWebsite,
            privacyPolicy,
            termsAndConditions,
            refundPolicy,
            shippingPolicy
        });
        await newPolicy.save();
        res.status(200).json({ message: 'Policy created successfully', policy: newPolicy });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPolicyByReferenceWebsite = async (req, res) => {
    try {
        const { referenceWebsite } = req.params;
        const policy = await Policy.findOne({ referenceWebsite }).populate('referenceWebsite');
        if (!policy) {
            return res.status(404).json({ message: 'Policy not found for this website' });
        }

        res.status(200).json(policy);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};