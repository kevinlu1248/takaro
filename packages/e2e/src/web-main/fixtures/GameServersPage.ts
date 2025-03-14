import { Page } from '@playwright/test';
import { GameServerOutputDTO } from '@takaro/apiclient';
import playwright from '@playwright/test';
const { expect } = playwright;

export class GameServersPage {
  constructor(public readonly page: Page, public gameServer: GameServerOutputDTO) {}

  async goto() {
    await this.page.goto('/servers', { waitUntil: 'domcontentloaded' });
  }
  async create() {
    await this.page.goto('/servers/create', { waitUntil: 'domcontentloaded' });
  }

  async action(action: 'Edit' | 'Delete') {
    const card = this.page.getByTestId(`gameserver-${this.gameServer.id}-card`);
    await card.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByText(`${action} server`).click();

    if (action === 'Delete') {
      await expect(this.page.getByRole('dialog')).toBeVisible();
      await this.page.getByRole('button', { name: 'Delete gameserver' }).click();
    }
  }

  async nameCreateEdit(value: string) {
    const gameServerNameInput = this.page.getByPlaceholder('My cool server');
    await gameServerNameInput.click();
    await gameServerNameInput.fill(value);
  }

  async selectGameServerType(value: string) {
    await this.page.getByText('Select...').click();
    await this.page.getByRole('option', { name: value }).locator('div').click();
  }

  async clickTestConnection() {
    await this.page.getByRole('button', { name: 'Test connection' }).click();
  }
  async clickSave() {
    await this.page.getByRole('button', { name: 'Save changes' }).click();
  }
}
