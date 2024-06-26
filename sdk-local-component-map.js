/* eslint-disable object-shorthand */
// Statically load all "local" components that aren't yet in the npm package

import AutoComplete from './src/components/override-sdk/field/AutoComplete/';
import CancelAlert from './src/components/override-sdk/field/CancelAlert/';
import Checkbox from './src/components/override-sdk/field/Checkbox/';
import Currency from './src/components/override-sdk/field/Currency/';
import Date from './src/components/override-sdk/field/Date/';
import DateTime from './src/components/override-sdk/field/DateTime/';
import Decimal from './src/components/override-sdk/field/Decimal/';
import Dropdown from './src/components/override-sdk/field/Dropdown/';
import Email from './src/components/override-sdk/field/Email/';
import Group from './src/components/override-sdk/field/Group/';
import Integer from './src/components/override-sdk/field/Integer/';
import Percentage from './src/components/override-sdk/field/Percentage/';
import Phone from './src/components/override-sdk/field/Phone/';
import RadioButtons from './src/components/override-sdk/field/RadioButtons/';
import RichText from './src/components/override-sdk/field/RichText/';
import ScalarList from './src/components/override-sdk/field/ScalarList/';
import SemanticLink from './src/components/override-sdk/field/SemanticLink/';
import TextArea from './src/components/override-sdk/field/TextArea/';
import TextContent from './src/components/override-sdk/field/TextContent/';
import TextInput from './src/components/override-sdk/field/TextInput/';
import Time from './src/components/override-sdk/field/Time/';
import Url from './src/components/override-sdk/field/URL/';
import UserReference from './src/components/override-sdk/field/UserReference/';
import AppShell from './src/components/override-sdk/template/AppShell/';
import BannerPage from './src/components/override-sdk/template/BannerPage/';
import CaseSummary from './src/components/override-sdk/template/CaseSummary/';
import CaseView from './src/components/override-sdk/template/CaseView/';
import CaseViewActionsMenu from './src/components/override-sdk/template/CaseViewActionsMenu/';
import Confirmation from './src/components/override-sdk/template/Confirmation/';
import DataReference from './src/components/override-sdk/template/DataReference/';
import DefaultForm from './src/components/override-sdk/template/DefaultForm/';
import Details from './src/components/override-sdk/template/Details/';
import DetailsSubTabs from './src/components/override-sdk/template/DetailsSubTabs/';
import DetailsTwoColumn from './src/components/override-sdk/template/DetailsTwoColumn/';
import DetailsThreeColumn from './src/components/override-sdk/template/DetailsThreeColumn/';
import FieldGroupTemplate from './src/components/override-sdk/template/FieldGroupTemplate/';
import InlineDashboard from './src/components/override-sdk/template/InlineDashboard/';
import InlineDashboardPage from './src/components/override-sdk/template/InlineDashboardPage/';
import ListPage from './src/components/override-sdk/template/ListPage/';
import ListView from './src/components/override-sdk/template/ListView/';
import MultiReferenceReadOnly from './src/components/override-sdk/template/MultiReferenceReadOnly/';
import NarrowWide from './src/components/override-sdk/template/NarrowWide/';
import NarrowWideDetails from './src/components/override-sdk/template/NarrowWideDetails/';
import NarrowWideForm from './src/components/override-sdk/template/NarrowWideForm/';
import NarrowWidePage from './src/components/override-sdk/template/NarrowWidePage/';
import OneColumn from './src/components/override-sdk/template/OneColumn/';
import OneColumnPage from './src/components/override-sdk/template/OneColumnPage/';
import OneColumnTab from './src/components/override-sdk/template/OneColumnTab/';
import PromotedFilters from './src/components/override-sdk/template/PromotedFilters/';
import SimpleTable from './src/components/override-sdk/template/SimpleTable/';
import SimpleTableManual from './src/components/override-sdk/template/SimpleTableManual/';
import SimpleTableSelect from './src/components/override-sdk/template/SimpleTableSelect/';
import SingleReferenceReadOnly from './src/components/override-sdk/template/SingleReferenceReadOnly/';
import SubTabs from './src/components/override-sdk/template/SubTabs/';
import TwoColumn from './src/components/override-sdk/template/TwoColumn/';
import TwoColumnPage from './src/components/override-sdk/template/TwoColumnPage/';
import TwoColumnTab from './src/components/override-sdk/template/TwoColumnTab/';
import WideNarrow from './src/components/override-sdk/template/WideNarrow/';
import WideNarrowDetails from './src/components/override-sdk/template/WideNarrowDetails/';
import WideNarrowForm from './src/components/override-sdk/template/WideNarrowForm/';
import WideNarrowPage from './src/components/override-sdk/template/WideNarrowPage/';
import WssNavBar from './src/components/override-sdk/template/WssNavBar/';
import AppAnnouncement from './src/components/override-sdk/widget/AppAnnouncement/';
import Attachment from './src/components/override-sdk/widget/Attachment/';
import CaseHistory from './src/components/override-sdk/widget/CaseHistory/';
import FileUtility from './src/components/override-sdk/widget/FileUtility/';
import ActionButtonsForFileUtil from './src/components/override-sdk/widget/ActionButtonsForFileUtil/';
import Followers from './src/components/override-sdk/widget/Followers/';
import QuickCreate from './src/components/override-sdk/widget/QuickCreate/';
import SummaryItem from './src/components/override-sdk/widget/SummaryItem/';
import SummaryList from './src/components/override-sdk/widget/SummaryList/';
import ToDo from './src/components/override-sdk/widget/ToDo/';
import AlertBanner from './src/components/override-sdk/designSystemExtension/AlertBanner/';
import Banner from './src/components/override-sdk/designSystemExtension/Banner/';
import CaseSummaryFields from './src/components/override-sdk/designSystemExtension/CaseSummaryFields/';
import DetailsFields from './src/components/override-sdk/designSystemExtension/DetailsFields/';
import FieldGroup from './src/components/override-sdk/designSystemExtension/FieldGroup/';
import FieldGroupList from './src/components/override-sdk/designSystemExtension/FieldGroupList/';
import FieldValueList from './src/components/override-sdk/designSystemExtension/FieldValueList/';
import Operator from './src/components/override-sdk/designSystemExtension/Operator/';
import Pulse from './src/components/override-sdk/designSystemExtension/Pulse/';
import RichTextEditor from './src/components/override-sdk/designSystemExtension/RichTextEditor/';
import WssQuickCreate from './src/components/override-sdk/designSystemExtension/WssQuickCreate/';
import ActionButtons from './src/components/override-sdk/infra/ActionButtons/';
import Assignment from './src/components/override-sdk/infra/Assignment/';
import AssignmentCard from './src/components/override-sdk/infra/AssignmentCard/';
import DashboardFilter from './src/components/override-sdk/infra/DashboardFilter/';
import DeferLoad from './src/components/override-sdk/infra/DeferLoad/';
import ErrorBoundary from './src/components/override-sdk/infra/ErrorBoundary/';
import MultiStep from './src/components/override-sdk/infra/MultiStep/';
import NavBar from './src/components/override-sdk/infra/NavBar/';
import Stages from './src/components/override-sdk/infra/Stages/';
import VerticalTabs from './src/components/override-sdk/infra/VerticalTabs/';
import LeftAlignVerticalTabs from './src/components/override-sdk/infra/LeftAlignVerticalTabs/';
import View from './src/components/override-sdk/infra/View/';

// custom override
import FlowContainer from './src/components/override-sdk/infra/FlowContainer/FlowContainer';
import SweetLifeDeligthLibraryFeaturedProducts from './src/components/custom-sdk/widget/SweetLife_DeligthLibrary_FeaturedProducts/';
/* import end - DO NOT REMOVE */

// localSdkComponentMap is the JSON object where we'll store the components that are
// found locally. If not found here, we'll look in the Pega-provided component map

const localSdkComponentMap = {
  AutoComplete: AutoComplete,
  CancelAlert: CancelAlert,
  Checkbox: Checkbox,
  Currency: Currency,
  Date: Date,
  DateTime: DateTime,
  Decimal: Decimal,
  Dropdown: Dropdown,
  Email: Email,
  Group: Group,
  Integer: Integer,
  Percentage: Percentage,
  Phone: Phone,
  RadioButtons: RadioButtons,
  RichText: RichText,
  ScalarList: ScalarList,
  SemanticLink: SemanticLink,
  TextArea: TextArea,
  TextContent: TextContent,
  TextInput: TextInput,
  Time: Time,
  URL: Url,
  UserReference: UserReference,
  AppShell: AppShell,
  BannerPage: BannerPage,
  CaseSummary: CaseSummary,
  CaseView: CaseView,
  CaseViewActionsMenu: CaseViewActionsMenu,
  Confirmation: Confirmation,
  DataReference: DataReference,
  DefaultForm: DefaultForm,
  Details: Details,
  DetailsSubTabs: DetailsSubTabs,
  DetailsTwoColumn: DetailsTwoColumn,
  DetailsThreeColumn: DetailsThreeColumn,
  FieldGroupTemplate: FieldGroupTemplate,
  InlineDashboard: InlineDashboard,
  InlineDashboardPage: InlineDashboardPage,
  ListPage: ListPage,
  ListView: ListView,
  MultiReferenceReadOnly: MultiReferenceReadOnly,
  NarrowWide: NarrowWide,
  NarrowWideDetails: NarrowWideDetails,
  NarrowWideForm: NarrowWideForm,
  NarrowWidePage: NarrowWidePage,
  OneColumn: OneColumn,
  OneColumnPage: OneColumnPage,
  OneColumnTab: OneColumnTab,
  PromotedFilters: PromotedFilters,
  SimpleTable: SimpleTable,
  SimpleTableManual: SimpleTableManual,
  SimpleTableSelect: SimpleTableSelect,
  SingleReferenceReadOnly: SingleReferenceReadOnly,
  SubTabs: SubTabs,
  TwoColumn: TwoColumn,
  TwoColumnPage: TwoColumnPage,
  TwoColumnTab: TwoColumnTab,
  WideNarrow: WideNarrow,
  WideNarrowDetails: WideNarrowDetails,
  WideNarrowForm: WideNarrowForm,
  WideNarrowPage: WideNarrowPage,
  WssNavBar: WssNavBar,
  AppAnnouncement: AppAnnouncement,
  Attachment: Attachment,
  CaseHistory: CaseHistory,
  FileUtility: FileUtility,
  ActionButtonsForFileUtil: ActionButtonsForFileUtil,
  Followers: Followers,
  QuickCreate: QuickCreate,
  SummaryItem: SummaryItem,
  SummaryList: SummaryList,
  Todo: ToDo,
  AlertBanner: AlertBanner,
  Banner: Banner,
  CaseSummaryFields: CaseSummaryFields,
  DetailsFields: DetailsFields,
  FieldGroup: FieldGroup,
  FieldGroupList: FieldGroupList,
  FieldValueList: FieldValueList,
  Operator: Operator,
  Pulse: Pulse,
  RichTextEditor: RichTextEditor,
  WssQuickCreate: WssQuickCreate,
  ActionButtons: ActionButtons,
  Assignment: Assignment,
  AssignmentCard: AssignmentCard,
  DashboardFilter: DashboardFilter,
  DeferLoad: DeferLoad,
  ErrorBoundary: ErrorBoundary,
  MultiStep: MultiStep,
  NavBar: NavBar,
  Stages: Stages,
  VerticalTabs: VerticalTabs,
  LeftAlignVerticalTabs: LeftAlignVerticalTabs,
  View: View,
  FlowContainer: FlowContainer,
  SweetLife_DeligthLibrary_FeaturedProducts: SweetLifeDeligthLibraryFeaturedProducts
  /* map end - DO NOT REMOVE */
};

export default localSdkComponentMap;
