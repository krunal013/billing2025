import { lazy } from 'react';

const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Form = lazy(() => import('../pages/Form/form'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const addcmp = lazy(() => import('../pages/Form/AddCompanyForm'));
const AddCompnay = lazy(() => import('../pages/Form/AddCompnay'));
const CompList = lazy(() => import('../pages/Form/CompanyList'));
const InvoiceTable = lazy(() => import('../pages/Dashboard/InvoiceTable'))
const CompanyProfile = lazy(() => import('../pages/Form/CompanyProfile'));
const CompanyProfileNew = lazy(() => import('../pages/Form/CompanyProfileNew'));

const coreRoutes = [
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/forms/form',
    title: 'form',
    component: Form,
  },
  {
    path: '/forms/addcmp',
    title: 'addcmp',
    component: addcmp,
  },
  {
    path: '/forms/AddCompnay',
    title: 'AddCompnay',
    component: AddCompnay,
  },
  {
    path: '/forms/CompList',
    title: 'CompList',
    component: CompList,
  },
  {
    path: '/InvoiceTable',
    title: 'InvoiceTable',
    component: InvoiceTable,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/company/:companyId', // Define the route with companyId as a URL parameter
    title: 'Company Profile',
    component: CompanyProfile,
  },
  {
    path: '/CompanyProfileNew',
    title: 'CompanyProfileNew',
    component: CompanyProfileNew,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
];

const routes = [...coreRoutes];
export default routes;
