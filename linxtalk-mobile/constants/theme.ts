
type ColorShades = {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
};

const primaryColor: ColorShades = {
    50: '#E9F8F9',
    100: '#BAEAEC',
    200: '#98DFE3',
    300: '#69D1D7',
    400: '#4CC8CF',
    500: '#1FBAC3',
    600: '#1CA9B1',
    700: '#16848A',
    800: '#11666B',
    900: '#0D4E52',
};

const redColor: ColorShades = {
    50: '#FFF4F5',
    100: '#FFDCE0',
    200: '#FFCBD1',
    300: '#FFB3BD',
    400: '#FFA4B0',
    500: '#FF8D9C',
    600: '#E84F63',
    700: '#B53E4D',
    800: '#8C303C',
    900: '#6B252E',
};

const greyColor: ColorShades = {
    50: '#F3F3F3',
    100: '#DADADA',
    200: '#C8C8C8',
    300: '#AFAFAF',
    400: '#9F9F9F',
    500: '#878787',
    600: '#7B7B7B',
    700: '#606060',
    800: '#4A4A4A',
    900: '#393939',
};

type ToastColor = {
    success: string;
    error: string;
    warning: string;
    info: string;
};

const toastColor: ToastColor = {
    success: "#4E8C7C",
    error: "#E04063",
    warning: "#FD871F",
    info: "#006FE0",
};

export const Colors = {
    primary: primaryColor,
    red: redColor,
    grey: greyColor,
    toast: toastColor,
};
