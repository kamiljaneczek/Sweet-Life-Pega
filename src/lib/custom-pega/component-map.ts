import type { ComponentType } from 'react';
import type { CustomPConnectProps } from './types';
import FallbackComponent from './FallbackComponent';

// Containers
import FlowContainer from './containers/FlowContainer';
import ViewContainer from './containers/ViewContainer';
import Assignment from './containers/Assignment';
import Reference from './containers/Reference';

// Templates
import View from './templates/View';
import Region from './templates/Region';
import DefaultForm from './templates/DefaultForm';
import OneColumn from './templates/OneColumn';

// Fields
import TextInput from './fields/TextInput';
import Dropdown from './fields/Dropdown';
import Checkbox from './fields/Checkbox';
import TextArea from './fields/TextArea';

const componentMap = new Map<string, ComponentType<CustomPConnectProps>>();

// Register containers
componentMap.set('FlowContainer', FlowContainer);
componentMap.set('ViewContainer', ViewContainer);
componentMap.set('Assignment', Assignment);
componentMap.set('reference', Reference); // lowercase — matches Pega metadata convention

// Register templates
componentMap.set('View', View);
componentMap.set('Region', Region);
componentMap.set('DefaultForm', DefaultForm);
componentMap.set('OneColumn', OneColumn);

// Register fields
componentMap.set('TextInput', TextInput);
componentMap.set('Dropdown', Dropdown);
componentMap.set('Checkbox', Checkbox);
componentMap.set('TextArea', TextArea);

export function registerComponent(name: string, component: ComponentType<CustomPConnectProps>) {
  componentMap.set(name, component);
}

export function getCustomComponent(name: string): ComponentType<CustomPConnectProps> {
  return componentMap.get(name) ?? FallbackComponent;
}
