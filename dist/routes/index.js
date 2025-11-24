"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_route_1 = require("../app/modules/user/user.route");
const category_route_1 = require("../app/modules/Category/category.route");
const setting_route_1 = require("../app/modules/settings/setting.route");
const chat_route_1 = require("../app/modules/chat/chat.route");
const message_route_1 = require("../app/modules/message/message.route");
const referral_route_1 = require("../app/modules/referral/referral.route");
const subCategory_route_1 = require("../app/modules/subCategory/subCategory.route");
const service_route_1 = require("../app/modules/service/service.route");
const provider_route_1 = require("../app/modules/provider/provider.route");
const schedule_route_1 = require("../app/modules/schedule/schedule.route");
const booking_route_1 = require("../app/modules/booking/booking.route");
const contactSupport_route_1 = require("../app/modules/contactSupport/contactSupport.route");
const review_route_1 = require("../app/modules/Review/review.route");
const favList_route_1 = require("../app/modules/favList/favList.route");
const credits_route_1 = require("../app/modules/credits/credits.route");
const revenue_route_1 = require("../app/modules/revenues/revenue.route");
const system_route_1 = require("../app/modules/system/system.route");
const notification_route_1 = require("../app/modules/notification/notification.route");
const promoCode_route_1 = require("../app/modules/promoCode/promoCode.route");
const email_route_1 = require("../app/modules/email/email.route");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/referral',
        route: referral_route_1.ReferralRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/category',
        route: category_route_1.CategoryRoutes,
    },
    {
        path: '/sub-category',
        route: subCategory_route_1.SubCategoryRoutes,
    },
    {
        path: '/provider',
        route: provider_route_1.ProviderRoutes,
    },
    {
        path: '/service',
        route: service_route_1.ServiceRoutes,
    },
    {
        path: '/schedule',
        route: schedule_route_1.ScheduleRoutes,
    },
    {
        path: '/booking',
        route: booking_route_1.BookingRoutes,
    },
    {
        path: '/review',
        route: review_route_1.ReviewRoutes,
    },
    {
        path: '/fav-list',
        route: favList_route_1.FavListRoutes,
    },
    {
        path: '/chats',
        route: chat_route_1.ChatRoutes,
    },
    {
        path: '/messages',
        route: message_route_1.MessageRoutes,
    },
    {
        path: '/notifications',
        route: notification_route_1.NotificationRoutes,
    },
    {
        path: '/settings',
        route: setting_route_1.settingsRouter,
    },
    {
        path: '/contact-support',
        route: contactSupport_route_1.ContactSupportRoutes,
    },
    {
        path: '/credits',
        route: credits_route_1.CreditsRoutes,
    },
    {
        path: '/revenues',
        route: revenue_route_1.RevenueRoutes,
    },
    {
        path: '/system',
        route: system_route_1.SystemRoutes,
    },
    {
        path: '/promo-code',
        route: promoCode_route_1.PromoCodeRoutes,
    },
    {
        path: '/email',
        route: email_route_1.EmailRoutes,
    },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
