### Tera toolbox module which automatically claims the club rewards for you.

---

### Console Commands
| Command | Description | Status |
| :---: | :---: | :---: |
| `/8 autoclub` | Automatic claiming of club rewards on the desired character. | Enabled by default. |
| `/8 autoclub add` | To add the name of your currently logged in character to the name list. |  |
| `/8 autoclub list` | To show your current name list of already added characters. |  |
| `/8 autoclub clear` | To clear the complete name list if you want to add other characters. |  |

---

### Interface Commands
| Command | Description |
| :---: | :---: |
| `/8 autoclub config` | To enable or disable the module and add or remove names. |

---

### Configuration
- If you want to edit the config file you need to start tera toolbox and go to the server selection.
    - It will be generated afterwards in the modules folder.

---

- An list of things that can be edited can be found here. Only for experienced users.

| Config Name | Description |
| :---: | :---: |
| `names` | Add your character name here which should claim the rewards. |

---

### Note
- If you enter multiple names in the config file or settings interface you need to put an comma between each name.
- An list of the rewards which are currently supported by the module can be found here [Reward Overview](https://github.com/Tera-Shiraneko/auto-club-rewards/tree/master/Additional-Data).
- If there is already a name in the list and you add a new one via command the list will be overwritten.
- The language of the item name in the claim message is depending of your ingame language settings.
- In case you want support for your region too send me the item id's of those daily reward items.