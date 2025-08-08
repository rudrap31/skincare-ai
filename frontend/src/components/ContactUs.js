import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabase';
import Toast from 'react-native-toast-message';

const ContactUsModal = ({ visible, onClose }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
        category: '',
    });
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: 'bug', label: 'Bug Report', icon: '🐛' },
        { id: 'feature', label: 'Feature Request', icon: '💡' },
        { id: 'support', label: 'General Support', icon: '❓' },
        { id: 'feedback', label: 'Feedback', icon: '💭' },
        { id: 'other', label: 'Other', icon: '📝' },
    ];

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCategorySelect = (categoryId) => {
        setForm(prev => ({ ...prev, category: categoryId }));
    };

    const validateForm = () => {
        if (!form.name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Name is required',
            });
            return false;
        }
        if (!form.email.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Email is required',
            });
            return false;
        }
        if (!form.message.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Message is required',
            });
            return false;
        }
        if (!form.category) {
            Toast.show({
                type: 'error',
                text1: 'Please select a category',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm() || loading) return;

        setLoading(true);

        try {
            // Store in Supabase
            const { error } = await supabase
                .from('contact_messages')
                .insert({
                    user_id: user?.id || null,
                    name: form.name.trim(),
                    email: form.email.trim(),
                    subject: form.subject.trim() || "",
                    message: form.message.trim(),
                    category: form.category
                });

            if (error) {
                console.error('Supabase error:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to send message',
                    text2: 'Please try again later',
                });
                return;
            }

            setForm({
                name: user?.name || '',
                email: user?.email || '',
                subject: '',
                message: '',
                category: '',
            });

            setTimeout(() => {
                onClose(true);
            }, 200);

        } catch (error) {
            console.error('Submit error:', error);
            Toast.show({
                type: 'error',
                text1: 'Something went wrong',
                text2: 'Please check your connection and try again',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return; // Prevent closing while sending
        onClose(false);
    };

    const CategoryButton = ({ category }) => (
        <TouchableOpacity
            onPress={() => handleCategorySelect(category.id)}
            className={`flex-row items-center p-3 rounded-xl mb-3 ${
                form.category === category.id
                    ? 'bg-purple-600/30 border border-purple-500'
                    : 'bg-gray-800/50 border border-gray-700'
            }`}
        >
            <Text className="text-2xl mr-3">{category.icon}</Text>
            <Text className={`flex-1 ${
                form.category === category.id ? 'text-purple-300' : 'text-white'
            }`}>
                {category.label}
            </Text>
            {form.category === category.id && (
                <View className="w-5 h-5 bg-purple-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView 
                className="flex-1 bg-black/90"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View className="flex-1 px-6 pt-8">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={loading}
                            className="p-2"
                        >
                            <Text className="text-purple-500 text-lg">✕</Text>
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">
                            Contact Us
                        </Text>
                        <View className="w-8" />
                    </View>
                    
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        className="flex-1"
                    >
                        {/* Intro */}
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 bg-purple-600/20 rounded-full items-center justify-center mb-3">
                                <Text className="text-3xl">📞</Text>
                            </View>
                            <Text className="text-gray-400 text-center text-base">
                                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                            </Text>
                        </View>

                        {/* Category Selection */}
                        <View className="mb-6">
                            <Text className="text-white text-lg font-semibold mb-4">
                                What can we help you with?
                            </Text>
                            {categories.map((category) => (
                                <CategoryButton key={category.id} category={category} />
                            ))}
                        </View>

                        {/* Form Fields */}
                        <View className="mb-6">
                            <Text className="text-white text-lg font-semibold mb-4">
                                Tell us more
                            </Text>
                            
                            {/* Name */}
                            <View className="mb-4">
                                <Text className="text-white mb-2 ml-2">Name *</Text>
                                <TextInput
                                    value={form.name}
                                    onChangeText={(text) => handleInputChange('name', text)}
                                    placeholder="Your full name"
                                    placeholderTextColor="#666"
                                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333]"
                                    editable={!loading}
                                />
                            </View>

                            {/* Email */}
                            <View className="mb-4">
                                <Text className="text-white mb-2 ml-2">Email *</Text>
                                <TextInput
                                    value={form.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                    placeholder="your.email@example.com"
                                    placeholderTextColor="#666"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333]"
                                    editable={!loading}
                                />
                            </View>

                            {/* Subject */}
                            <View className="mb-4">
                                <Text className="text-white mb-2 ml-2">Subject</Text>
                                <TextInput
                                    value={form.subject}
                                    onChangeText={(text) => handleInputChange('subject', text)}
                                    placeholder="Brief description"
                                    placeholderTextColor="#666"
                                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333]"
                                    editable={!loading}
                                />
                            </View>

                            {/* Message */}
                            <View className="mb-6">
                                <Text className="text-white mb-2 ml-2">Message *</Text>
                                <TextInput
                                    value={form.message}
                                    onChangeText={(text) => handleInputChange('message', text)}
                                    placeholder="Please provide details about your inquiry..."
                                    placeholderTextColor="#666"
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl border border-[#333] h-28"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`py-4 rounded-xl mx-4 mb-6 ${
                                loading ? 'bg-purple-600/50' : 'bg-purple-600'
                            }`}
                        >
                            {loading ? (
                                <View className="flex-row items-center justify-center">
                                    <ActivityIndicator size="small" color="white" />
                                    <Text className="text-white text-center text-lg font-bold ml-2">
                                        Sending...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-white text-center text-lg font-bold">
                                    Send Message
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Footer */}
                        <View className="items-center pb-8">
                            <Text className="text-gray-500 text-sm text-center">
                                We typically respond within 24-48 hours
                            </Text>
                        </View>
                    </ScrollView>
                </View>
                <Toast />
            </KeyboardAvoidingView>
            
        </Modal>
    );
};

export default ContactUsModal;