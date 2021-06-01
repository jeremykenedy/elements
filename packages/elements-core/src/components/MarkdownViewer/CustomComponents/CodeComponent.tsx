import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JsonSchemaViewer } from '@stoplight/json-schema-viewer';
import { CustomComponentMapping, DefaultSMDComponents } from '@stoplight/markdown-viewer';
import { Box, Flex } from '@stoplight/mosaic';
import { HttpParamStyles, IHttpOperation, IHttpRequest, NodeType } from '@stoplight/types';
import { isObject } from 'lodash';
import React from 'react';
import URI from 'urijs';

import { NodeTypeColors, NodeTypeIconDefs } from '../../../constants';
import { useInlineRefResolver } from '../../../context/InlineRefResolver';
import { useParsedValue } from '../../../hooks/useParsedValue';
import { JSONSchema } from '../../../types';
import { isHttpOperation, isJSONSchema } from '../../../utils/guards';
import { TryIt } from '../../TryIt';

type PartialHttpRequest = Pick<IHttpRequest, 'method' | 'url'> & Partial<IHttpRequest>;

function isPartialHttpRequest(maybeHttpRequest: unknown): maybeHttpRequest is PartialHttpRequest {
  return (
    isObject(maybeHttpRequest) &&
    'method' in maybeHttpRequest &&
    typeof maybeHttpRequest['method'] === 'string' &&
    'url' in maybeHttpRequest &&
    typeof maybeHttpRequest['url'] === 'string'
  );
}

const DefaultCode = DefaultSMDComponents.code!;
interface ISchemaAndDescriptionProps {
  schema: JSONSchema;
  title?: string;
}

const SchemaAndDescription = ({ title: titleProp, schema }: ISchemaAndDescriptionProps) => {
  const resolveRef = useInlineRefResolver();
  const title = titleProp ?? schema.title;
  return (
    <Box py={2}>
      {title && (
        <Flex alignItems="center" p={2}>
          <FontAwesomeIcon icon={NodeTypeIconDefs[NodeType.Model]} color={NodeTypeColors[NodeType.Model]} />
          <Box color="muted" px={2}>
            {title}
          </Box>
        </Flex>
      )}

      <JsonSchemaViewer resolveRef={resolveRef} schema={schema} />
    </Box>
  );
};

export const CodeComponent: CustomComponentMapping['code'] = props => {
  const { title, children, jsonSchema, http, resolved } = props;

  const parsedValue = useParsedValue(resolved ?? (Array.isArray(children) ? children[0] : children));

  if (jsonSchema) {
    if (!isJSONSchema(parsedValue)) {
      return null;
    }

    return <SchemaAndDescription title={title} schema={parsedValue} />;
  }

  if (http) {
    if (!isObject(parsedValue) || (!isPartialHttpRequest(parsedValue) && !isHttpOperation(parsedValue))) {
      return null;
    }

    return <TryIt httpOperation={isHttpOperation(parsedValue) ? parsedValue : parseHttpRequest(parsedValue)} />;
  }

  return <DefaultCode {...props} />;
};

export function parseHttpRequest(data: PartialHttpRequest): IHttpOperation {
  const uri = URI(data.url);
  return {
    id: '?http-operation-id?',
    method: data.method,
    path: uri.is('absolute') ? uri.path() : data.url,
    servers: [{ url: uri.is('absolute') ? uri.origin() : data.baseUrl || '' }],
    request: {
      query: Object.entries(data.query || {}).map(([key, value]) => ({
        name: key,
        style: HttpParamStyles.Form,
        schema: { default: Array.isArray(value) && value.length > 0 ? value[0] : value },
      })),
      headers: Object.entries(data.headers || {}).map(([key, value]) => ({
        name: key,
        style: HttpParamStyles.Simple,
        schema: { default: value },
      })),
      ...(data.body
        ? { body: { contents: [{ mediaType: 'application/json', schema: { default: data.body } }] } }
        : null),
    },
    responses: [],
  };
}
