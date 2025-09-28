import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CategoryRoutes } from '../app/modules/Category/category.route';
import { settingsRouter } from '../app/modules/settings/setting.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { MessageRoutes } from '../app/modules/message/message.route';
import { ReferralRoutes } from '../app/modules/referral/referral.route';
import { SubCategoryRoutes } from '../app/modules/subCategory/subCategory.route';
import { ServiceRoutes } from '../app/modules/service/service.route';
import { ProviderRoutes } from '../app/modules/provider/provider.route';
import { ScheduleRoutes } from '../app/modules/schedule/schedule.route';
import { BookingRoutes } from '../app/modules/booking/booking.route';
import { ContactSupportRoutes } from '../app/modules/contactSupport/contactSupport.route';
import { ReviewRoutes } from '../app/modules/Review/review.route';
import { FavListRoutes } from '../app/modules/favList/favList.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/referral',
    route: ReferralRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/sub-category',
    route: SubCategoryRoutes,
  },
  {
    path: '/provider',
    route: ProviderRoutes,
  },
  {
    path: '/service',
    route: ServiceRoutes,
  },
  {
    path: '/schedule',
    route: ScheduleRoutes,
  },
  {
    path: '/booking',
    route: BookingRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
  {
    path: '/fav-list',
    route: FavListRoutes,
  },
  {
    path: '/chats',
    route: ChatRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/settings',
    route: settingsRouter,
  },
  {
    path: '/contact-support',
    route: ContactSupportRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
