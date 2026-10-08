/** Assets */
import LIGHT_IMG from "../assets/media/prod_theme_light.jpeg"
import DARK_IMG from "../assets/media/prod_theme_dark.jpeg"
import MONOCHROME_DARK_IMG from "../assets/media/prod_theme_monochrome_dark.jpeg"
import EN_US_IMG from "../assets/media/prod_locale_en_us.jpeg"
import EL_GR_IMG from "../assets/media/prod_locale_el_gr.jpeg"

export const features = {
  "profile": {
    "name": "personal_information",
    "categories": [
      {
        "name": "settings_account_information",
        "icon": "id-card-outline",
      },
      {
        "name": "settings_account_password",
        "icon": "key-outline",
      },
      {
        "name": "settings_account_access",
        "icon": "shield-outline",
      },
      {
        "name": "settings_account_download",
        "icon": "cloud-download-outline",
      },
      {
        "name": "settings_account_deactivate",
        "icon": "person-remove-outline",
      }
    ]
  },
  "quick_buttons": {
    "left": {
      "name": "contact",
      "icon": "paper-plane-outline",
    },
    "middle": {
      "name": "notifications",
      "icon": "mail-unread-outline",
    },
    "right": {
      "name": "sign_out Out",
      "icon": "log-out-outline",
    }
  },
  "menu": [
    {
      "name": "preferences",
      "icon": "options-sharp",
      "chevron": true,
      "categories": [
        {
          "name": "settings_account_theme",
          "icon": "contrast-outline",
          "options": [
            {
              "name": "light",
              "image": LIGHT_IMG,
              "overlay": true
            },
            {
              "name": "dark",
              "image": DARK_IMG,
              "overlay": false
            },
            {
              "name": "monochrome_dark",
              "image": MONOCHROME_DARK_IMG,
              "overlay": false
            }
          ]
        },
        {
          "name": "settings_account_language",
          "icon": "language-outline",
          "options": [
            {
              "name": "english",
              "image": EN_US_IMG,
              "overlay": false
            },
            {
              "name": "greek",
              "image": EL_GR_IMG,
              "overlay": true
            }
          ]
        }
      ]
    },
    {
      "name": "help",
      "icon": "help-buoy-outline",
      "chevron": true,
      "categories": [
        {
          "name": "help_center",
          "icon": "library-outline",
          "action": "help"
        },
        {
          "name": "report_issue",
          "icon": "bug-outline",
          "action": "issue"
        },
        {
          "name": "propose_feature",
          "icon": "bulb-outline",
          "action": "feature"
        }
      ]
    },
    {
      "name": "legal",
      "icon": "briefcase-outline",
      "chevron": true,
      "categories": [
        {
          "name": "terms_of_service",
          "icon": "book-outline",
          "action": "tos"
        },
        {
          "name": "privacy_policy",
          "icon": "lock-closed-outline",
          "action": "policy"
        }
      ]
    }
  ]
}