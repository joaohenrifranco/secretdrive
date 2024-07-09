import type {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  InputPassword,
  PageHeader,
} from 'ant-design-vue';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    AAvatar: typeof Avatar;
    AButton: typeof Button;
    AButtonGroup: typeof ButtonGroup;
    ACard: typeof Card;
    ACardBody: typeof CardBody;
    ACardFooter: typeof CardFooter;
    APageHeader: typeof PageHeader;
    AInputPassword: typeof InputPassword;
    ASpace: typeof Space;
    ASpin: typeof Spin;
  }
}
