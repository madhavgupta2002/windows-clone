import { Icon } from '../Icon'
import { useOS } from '../os'
import type { AppProps } from '../types'
import { argStr } from './util'

/**
 * "About Windows" / winver dialog. `.about-logo` is an empty slot that each
 * version styles (background image / gradient); `args.logo` can supply an icon instead.
 */
export default function About({ winId, args }: AppProps) {
  const os = useOS()
  const { product, version, copyright, extra } = os.about
  const logo = argStr(args, 'logo')
  return (
    <div className="app app-about">
      <div className="about-body">
        <div className="about-logo">{logo && <Icon src={logo} size={48} />}</div>
        <div className="about-text">
          <div className="about-product">{product}</div>
          <div className="about-version">{version}</div>
          {copyright && <div className="about-copyright">{copyright}</div>}
          {extra && <div className="about-extra">{extra}</div>}
        </div>
      </div>
      <div className="msgbox-buttons">
        <button type="button" className="btn" autoFocus onClick={() => os.close(winId)}>OK</button>
      </div>
    </div>
  )
}
