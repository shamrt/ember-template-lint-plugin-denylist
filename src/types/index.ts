export type ForbiddenValues = string | string[];

type Attribute = {
  name: Attribute | string;
  values: ForbiddenValues;
};

export type DenylistConfig = {
  attributes?: Attribute[];
};

export type FullDenylistConfig = DenylistConfig | boolean;
