import { DeploymentModel } from '@kubevirt-models';
import { DeploymentKind, K8sResourceCommon, PodTemplate } from '@kubevirt-types';
import { Selector } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

import { K8sResourceWrapper } from '../common/k8s-resource-wrapper';
import { K8sInitAddon } from '../common/util/k8s-mixin';

export class DeploymentWrappper extends K8sResourceWrapper<DeploymentKind, DeploymentWrappper> {
  constructor(deployment?: K8sResourceCommon | DeploymentWrappper | any, copy = false) {
    super(DeploymentModel, deployment, copy);
  }

  init(data: K8sInitAddon & { replicas?: number } = {}) {
    super.init(data);
    const { replicas } = data;

    if (replicas != null) {
      this.setReplicas(replicas);
    }

    return this;
  }

  setReplicas = (replicas: number) => {
    this.ensurePath('spec');
    this.data.spec.replicas = replicas;
    return this;
  };

  setSelector = (selector: Selector) => {
    this.ensurePath('spec');
    this.data.spec.selector = selector;
    return this;
  };

  setTemplate = (template: PodTemplate) => {
    this.ensurePath('spec');
    this.data.spec.template = template;
    return this;
  };
}
