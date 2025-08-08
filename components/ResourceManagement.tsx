'use client';

import React from 'react';
import TeachingResourceManagement from './TeachingResourceManagement';
import ExtracurricularResourceManagement from './ExtracurricularResourceManagement';
import ResourceTypeManagement from './ResourceTypeManagement';
import { ResourceManagementProps } from './types/ResourceTypes';

const ResourceManagement: React.FC<ResourceManagementProps> = ({ type }) => {
  switch (type) {
    case 'teaching':
      return <TeachingResourceManagement />;
    case 'extracurricular':
      return <ExtracurricularResourceManagement />;
    case 'type':
      return <ResourceTypeManagement />;
    default:
      return <TeachingResourceManagement />;
  }
};

export default ResourceManagement;