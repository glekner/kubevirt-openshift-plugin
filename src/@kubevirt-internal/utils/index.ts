// kubevirt source utils
export * from '../../utils';

// console internal copied modules
export * from './datetime';
export * from './internal';
export * from './k8s-ref';
export * from './safety-first';
export * from './units';
export * from './url-poll-hook';

// k8s methods
export * from './k8s-methods';

/*
 TODO: The following modules should be either copied to kubevirt or exposed from the public sdk
*/
export {
  referenceFor,
  referenceForExtensionModel,
  referenceForModel,
} from '@openshift-console/dynamic-plugin-sdk-internal';
export {
  connectToFlags,
  connectToPlural,
  createConnectorCallback,
  getActiveNamespace,
  getPropertyDescription,
  getSwaggerDefinitions,
  modelFor,
  modelForGroupKind,
  openAPItoJSONSchema,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk-kubevirt-internal';
