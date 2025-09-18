import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
// there are currently no _real_ tests for release-pull-request
describe(`release-pull-request`, () => {
    it(`should pass the example test`, async () => {
        // Arrange
        // Act
        await expect(Promise.resolve(1))
            .resolves.toBeGreaterThan(0);
        // Assert
    });
});
