import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown, faChevronRight, faCloud, faCube } from '@fortawesome/free-solid-svg-icons';

import { ApiElement } from './components';

library.add(faChevronDown, faChevronRight, faCube, faCloud);

window.customElements.define('elements-api', ApiElement);
dom.watch();
