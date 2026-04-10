import { View } from "react-native";
import { useState } from "react";
import Button from "@/library/Button";
import { useModalStore } from "@/store/modal-store";
import { useTranslation } from "react-i18next";
import Input from "@/library/Input";
import { useAccountStore } from "@/store/account-store";

interface AddMessageModalProps {
    onSend: (message: string) => void;
}

export default function AddMessageModal({ onSend }: AddMessageModalProps) {
    const { t } = useTranslation();
    const { account } = useAccountStore();
    const { hideModal } = useModalStore();
    const [message, setMessage] = useState(t('friends.defaultMessage', { name: account.displayName }));

    const handleSend = () => {
        onSend(message.trim());
        hideModal();
    };

    return (
        <View className="flex flex-col gap-6 w-[320px] max-w-full mt-2">
            <Input
                label={t('friends.message')}
                placeholder={t('friends.messagePlaceholder')}
                icon="chatbubble-outline"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
                autoFocus
                maxCharCount={150}
                className="!rounded-lg"
            />
            <Button
                title={t('friends.send')}
                onPress={handleSend}
            />
        </View>
    );
}
