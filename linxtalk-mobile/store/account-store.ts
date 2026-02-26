import {create} from "zustand";
import {Account} from "@/constants/type";

interface AccountState {
    account: Account;
    setAccount: (account: Account) => void;
    clearAccount: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
    account: {
        username: null,
        email: null,
        displayName: null,
        avatarUrl: null,
    },
    setAccount: (account: Account) => set({account}),
    clearAccount: () => set({account: {
        username: null,
        email: null,
        displayName: null,
        avatarUrl: null,
    }}),
}));