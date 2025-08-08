import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
        
        // Optional: Send to crash reporting service
        // crashlytics().recordError(error);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 justify-center items-center bg-black px-6">
                    <Text className="text-white text-2xl font-bold mb-4 text-center">
                        Oops! Something went wrong
                    </Text>
                    <Text className="text-gray-400 text-center text-base mb-8">
                        We're sorry for the inconvenience. Please try restarting the app.
                    </Text>
                    <TouchableOpacity
                        onPress={this.handleReset}
                        className="bg-purple-600 px-8 py-3 rounded-xl mb-4"
                    >
                        <Text className="text-white font-semibold text-lg">
                            Try Again
                        </Text>
                    </TouchableOpacity>
                    {__DEV__ && (
                        <Text className="text-red-400 text-xs mt-4 text-center">
                            DEV: {this.state.error?.message}
                        </Text>
                    )}
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;