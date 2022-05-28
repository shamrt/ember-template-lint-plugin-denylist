type Attribute = {
  name: Attribute | string;
  values: string | string[];
};

export type DenylistConfig = {
  attributes?: Attribute[];
};

export type FullDenylistConfig = DenylistConfig | boolean;
