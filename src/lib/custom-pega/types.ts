/* eslint-disable @typescript-eslint/no-explicit-any */

/** Subset of the PConnect API surface used by custom rendering components. */
export interface PConnectProxy {
  getComponentName(): string;
  getChildren(): PConnectProxy[];
  resolveConfigProps(configProps: Record<string, any>): Record<string, any>;
  getConfigProps(): Record<string, any>;
  getStateProps(): Record<string, any>;
  getActionsApi(): PConnectActionsApi;
  getValidationApi(): { validate(): Promise<boolean> };
  getCaseInfo(): any;
  getContextName(): string;
  getDataObject(path: string): any;
  getPageReference(): string;
  getValue(path: string, defaultValue?: any): any;
  getTarget?(): string;
  setValue(propName: string, value: any): void;
  getInheritedProps(): Record<string, any>;
  getComponentConfig(): Record<string, any>;
  getReferencedView(): any;
  getContainerName(): string;
  ignoreSuggestion(propName: string): void;
  acceptSuggestion(propName: string): void;
  clearErrorMessages(options: { property: string }): void;
}

export interface PConnectActionsApi {
  finishAssignment(itemKey: string): Promise<any>;
  cancelAssignment(itemKey: string, skipDirtyCheck?: boolean): Promise<any>;
  saveAssignment(itemKey: string): Promise<any>;
  navigateToStep(direction: string, itemKey: string): Promise<any>;
  refreshCaseView(caseKey: string, refreshFor: string, pageRef: string, options?: any): Promise<any>;
  cancelCreateStageAssignment(itemKey: string): Promise<any>;
}

export interface CustomPConnectProps {
  pConnect: PConnectProxy;
}

export type CasePhase = 'idle' | 'creating' | 'active' | 'completed' | 'error';
