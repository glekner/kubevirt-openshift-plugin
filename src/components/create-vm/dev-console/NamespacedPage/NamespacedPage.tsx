import cx from 'classnames';
import * as React from 'react';

import { NamespaceBar } from '@kubevirt-internal';

import NamespaceBarApplicationSelector from './NamespaceBarApplicationSelector/NamespaceBarApplicationSelector';

import './NamespacedPage.scss';

export enum NamespacedPageVariants {
  light = 'light',
  default = 'default',
}

export interface NamespacedPageProps {
  disabled?: boolean;
  hideProjects?: boolean;
  hideApplications?: boolean;
  onNamespaceChange?: (newNamespace: string) => void;
  variant?: NamespacedPageVariants;
  toolbar?: React.ReactNode;
}

const NamespacedPage: React.FC<NamespacedPageProps> = ({
  children,
  disabled,
  onNamespaceChange,
  hideProjects = false,
  hideApplications = false,
  variant = NamespacedPageVariants.default,
  toolbar,
}) => (
  <div className="odc-namespaced-page">
    <NamespaceBar
      disabled={disabled}
      onNamespaceChange={onNamespaceChange}
      hideProjects={hideProjects}
    >
      {!hideApplications && <NamespaceBarApplicationSelector disabled={disabled} />}
      {toolbar && <div className="odc-namespaced-page__toolbar">{toolbar}</div>}
    </NamespaceBar>
    <div
      className={cx('odc-namespaced-page__content', {
        [`is-${variant}`]: variant !== NamespacedPageVariants.default,
      })}
    >
      {children}
    </div>
  </div>
);

export default NamespacedPage;
