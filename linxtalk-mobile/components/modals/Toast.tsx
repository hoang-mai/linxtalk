import { useToastStore } from "@/store/toast-store";
import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, FadeIn, FadeOut } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal } from "react-native";

export default function Toast() {
    const { toast, hideToast } = useToastStore();
    const width = useSharedValue(50);
    const opacity = useSharedValue(0);



    const toastStyle = useAnimatedStyle(() => ({
        width: width.value,
        opacity: opacity.value,
    }));

    useEffect(() => {
        const handleShowToast = () => {
            opacity.value = withTiming(1, { duration: 200 });
            width.value = withDelay(150, withTiming(320, { duration: 300 }));
        };

        const handleHideToast = () => {
            width.value = withTiming(50, { duration: 300 });
            opacity.value = withDelay(150, withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    scheduleOnRN(hideToast);
                }
            }));
        };
        if (toast) {
            handleShowToast();
            const timer = setTimeout(() => {
                handleHideToast();
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            width.value = 50;
            opacity.value = 0;
        }
    }, [hideToast, opacity, toast, width]);

    if (!toast) {
        return null;
    }

    const { bg, icon } = (() => {
        switch (toast.type) {
            case "success": return { bg: "bg-toast-success", icon: "checkmark-circle-outline" as const };
            case "error": return { bg: "bg-toast-error", icon: "close-circle-outline" as const };
            case "warning": return { bg: "bg-toast-warning", icon: "warning-outline" as const };
            case "info": return { bg: "bg-toast-info", icon: "information-circle-outline" as const };
            default: return { bg: "bg-toast-info", icon: "information-circle-outline" as const };
        }
    })();

    return (
        <Modal
            transparent={true}
            visible={!!toast}
            animationType="none"
            statusBarTranslucent
        >
            <Animated.View
                className={`absolute top-12 self-center z-50 p-4 rounded-full flex-row items-center overflow-hidden ${bg}`}
                style={toastStyle}
            >
                <Ionicons name={icon} size={20} color="white" />
                <Animated.Text
                    entering={FadeIn.delay(300).duration(200)}
                    exiting={FadeOut.duration(150)}
                    numberOfLines={1}
                    className="ml-2 text-white text-base font-semibold w-full"
                >
                    {toast.message}
                </Animated.Text>
            </Animated.View>
        </Modal>
    );
}