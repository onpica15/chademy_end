module.exports = function register(registerURL) {
  return `
    <div class="register_container">
      <table style="margin: 0 auto; width: 100%; border-collapse: collapse; font-family: sans-serif; background-color: #f7f7f7">
        <tbody>
          <tr style="background-color: white">
            <td style="width: 20px"></td>
            <td>
              <div>
                <div style="width: 157px; height: 157px; margin: 32px auto">
                  <img style="width: 100%; fill: #aa8041;" src='cid:unique@logo' title='' />
                </div>
              </div>
            </td>
            <td style="width: 20px"></td>
          </tr>

          <tr>
            <td style="width: 20px"></td>
            <td>
              <div style="margin-top: 48px; font-size: 16px; color: #3a3f52; font-weight: 300; text-align: center">
                <p style="margin-top: 0">點擊下方完成電子信箱驗證</p>
                <a
                  href="${registerURL}"
                  style="
                    display: block;
                    margin: 0 auto 32px;
                    width: 220px;
                    height: 50px;
                    text-decoration: none;"
                  target="_blank"
                  data-saferedirecturl="https://www.google.com/url?q=${registerURL}">

                  <button style="display: block; margin: 0 auto 32px; width: 220px; height: 50px; border-radius: 25px; background-color: #ded5c6; border: none; font-size: 20px">驗證</button>
                </a>
              </div>
            </td>
            <td style="width: 20px"></td>
          </tr>
          <tr>
            <td style="width: 20px"></td>
            <td>
              <div style="margin: 0 auto 48px; max-width: 480px">
                <div style="color: #7c8c8f; font-size: 13px; font-weight: 700; line-height: 20px; text-align: center">不是你本人嗎？</div>
                <div style="color: #7c8c8f; font-size: 13px; font-weight: 300; line-height: 20px; text-align: center">
                  別擔心！你的電子信箱可能不小心被輸入，
                  <br />
                  請直接忽略或刪除此郵件。
                </div>
              </div>
            </td>
            <td style="width: 20px"></td>
          </tr>
          <tr>
            <td style="width: 20px"></td>
            <td>
              <div style="margin-bottom: 32px; text-align: center">
                <a href="#" style="display: inline-block; width: 32px; height: 32px; margin-right: 12px" target="_blank">
                  <img src="https://ci4.googleusercontent.com/proxy/rLpCT2rSRyu_Zvq7iG1YQ72zTXdci4g9qQHdFP1BDJ23RmdMKuYiVQIcgCRpUuz2uMBmPm3g-fVtaULq7ww3tfSfpC1EgDfSQz25TVT3wu1OB3QUm6SfzoYammn_eErUoNWP8DYF=s0-d-e1-ft#https://goshare-mail-image-pro.s3-ap-southeast-1.amazonaws.com/images/icon-mail.png" alt="goshare-mail" style="width: 100%" class="CToWUd" />
                </a>
                <a href="#" style="display: inline-block; width: 32px; height: 32px; margin-right: 12px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.facebook.com/GoShareTW&amp;source=gmail&amp;ust=1604230120494000&amp;usg=AFQjCNF3pXpL46sd52InBOVm7xmCOOI08g">
                  <img src="https://ci5.googleusercontent.com/proxy/0su6XutZE5_6_X0fzV2O8280HZgmI_jcVfQkK_ftVOcKKOclmhIk9kAy7TZgOmlLTLl-wt3VwbwIcLPHtPi0yzB4RULpaQIczn8r1GM-GT9R4jy9SzJZxyoB28AzoZO4vR-AOw=s0-d-e1-ft#https://goshare-mail-image-pro.s3-ap-southeast-1.amazonaws.com/images/icon-fb.png" alt="goshare-facebook" style="width: 100%" class="CToWUd" />
                </a>
                <a href="#" style="display: inline-block; width: 32px; height: 32px; margin-right: 12px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.instagram.com/goshare.official&amp;source=gmail&amp;ust=1604230120494000&amp;usg=AFQjCNFXJh9X83UptF4byl6n5jEmciHTgA">
                  <img src="https://ci3.googleusercontent.com/proxy/oyRtBVTH4BOPsj-exAMT86ZWDLfaBvrhDDIWHuPZB9a1MvbGdBaTWIOwozNu9MBRV8w3_pJFjTYzyBnJ3kT2gPKeriZhftr-Psuo20Ax3BDy7a0bYNn2ILmKlsZyYXwdJSx7TQ=s0-d-e1-ft#https://goshare-mail-image-pro.s3-ap-southeast-1.amazonaws.com/images/icon-ig.png" alt="goshare-instagram" style="width: 100%" class="CToWUd" />
                </a>
                <a href="#" style="display: inline-block; width: 32px; height: 32px" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/company/ridegoshare&amp;source=gmail&amp;ust=1604230120494000&amp;usg=AFQjCNHAR3S7fwSLOHgEFqPkgtBeFzQ4qg">
                  <img src="https://ci5.googleusercontent.com/proxy/Rf13pAIFulRV6xZFBbtHwGPWUlTXvUEzi2oP40Hdq7xtNdUr9oS0h50TNxd7aQwduJFsAKArtsky-JrUTE3pHIsb1py49FJt4n4czy1ed2ekde4WO-6zJq8GJusCKxsFfzYg7LCuSCv9lQ=s0-d-e1-ft#https://goshare-mail-image-pro.s3-ap-southeast-1.amazonaws.com/images/icon-linkedin.png" alt="goshare-linkedin" style="width: 100%" class="CToWUd" />
                </a>
              </div>
            </td>
            <td style="width: 20px"></td>
          </tr>
          <tr>
            <td style="width: 20px"></td>
            <td>
              <div style="font-size: 12px; font-weight: bold; color: #3a3f52; text-align: center">Copyright © 2020 Chademy Inc.</div>
            </td>
            <td style="width: 20px"></td>
          </tr>
          <tr>
            <td style="width: 20px"></td>
            <td>
              <div style="font-size: 11px; line-height: 12px; margin-top: 8px; margin-bottom: 32px; text-align: center">
                <a href="#" style="display: inline-block; padding: 0 8px 0 4px; text-decoration: none; color: #3a3f52; border-right: 1px solid #3a3f52" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://ridegoshare.com/app/tw/privacy.html&amp;source=gmail&amp;ust=1604230120494000&amp;usg=AFQjCNFwLZZ7ikKjW2czIQQynQe077d7WQ"> 隱私權政策 </a>
                <a href="#" style="display: inline-block; padding: 0 0 0 4px; text-decoration: none; color: #3a3f52" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://ridegoshare.com/app/tw/eula.html&amp;source=gmail&amp;ust=1604230120494000&amp;usg=AFQjCNGGglCDzsxV5_hEjXE-RytmT0ZVuQ"> 服務條款 </a>
              </div>
            </td>
            <td style="width: 20px"></td>
          </tr>
        </tbody>
      </table>
    </div>`
}
