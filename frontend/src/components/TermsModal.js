import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Linking,
    Pressable,
} from 'react-native';

const TermsModal = ({ visible, onClose }) => {
    const openLink = (url) => {
        Linking.openURL(url);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <Pressable onPress={handleClose} className="flex-1 bg-black/30">
                <View
                    className="absolute bottom-0 w-full bg-neutral-900 p-6 rounded-t-2xl"
                    style={{ height: '40%' }} // Higher modal
                >
                    <Text className="text-white text-lg font-semibold mb-6 text-center">
                        View our Policies
                    </Text>

                    <View className="flex-row justify-between space-x-4 gap-4">
                        <TouchableOpacity
                            onPress={() =>
                                openLink(
                                    'https://simplyskin.vercel.app/privacy'
                                )
                            }
                            className="flex-1 p-4 bg-blue-600 rounded-xl items-center"
                        >
                            <Text className="text-white font-medium">
                                Privacy Policy
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                openLink('https://simplyskin.vercel.app/terms')
                            }
                            className="flex-1 p-4 bg-purple-600 rounded-xl items-center"
                        >
                            <Text className="text-white font-medium">
                                Terms of Service
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

export default TermsModal;
