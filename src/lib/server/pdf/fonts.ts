import { SERVER_ASSETS } from "$env/static/private";
import path from "path";
export const fonts = {
    ComputerModern: {
        normal: path.join(SERVER_ASSETS, "fonts/cmu/cmu.serif-roman.ttf"),
        bold: path.join(SERVER_ASSETS, "fonts/cmu/cmu.serif-bold.ttf"),
    },
};
