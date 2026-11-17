/** True for links that leave the site (and so open in a new tab). */
export const isExternal = (href) => /^https?:\/\//i.test(href ?? '')

/** The attributes every new-tab link needs, or nothing for an in-site link. */
export const externalProps = (href) =>
  isExternal(href) ? { target: '_blank', rel: 'noreferrer noopener' } : {}

/**
 * Only http(s), mailto and in-page links are ever rendered as links. Content
 * is trusted today, but this stops a `javascript:` URL becoming clickable if
 * it ever comes from somewhere that is not.
 */
export const isSafeHref = (href) =>
  typeof href === 'string' && /^(https?:\/\/|mailto:|#|\/)/i.test(href.trim())
